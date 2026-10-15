import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DsaJourney, DsaJourneyDocument } from './schemas/dsa-journey.schema';
import { ProblemsService } from '../problems/problems.service';

@Injectable()
export class DsaJourneyService {
    constructor(
        @InjectModel(DsaJourney.name) private journeyModel: Model<DsaJourneyDocument>,
        private problemsService: ProblemsService
    ) {}

    async createJourney(userId: string, topics: string[], goal: string) {
        // Disable existing active journeys
        await this.journeyModel.updateMany({ userId, status: 'active' }, { status: 'completed' });

        const allProblems = await this.problemsService.findAll();
        
        const journeyTopics = [];
        const journeyProblems = [];
        let globalProblemOrder = 0;

        for (let i = 0; i < topics.length; i++) {
            const topic = topics[i];
            
            journeyTopics.push({
                topicName: topic,
                status: i === 0 ? 'unlocked' : 'locked',
                order: i
            });

            // Find problems for this topic
            const topicProblems = allProblems.filter(p => p.topics && p.topics.includes(topic));
            
            // Basic sort by difficulty
            const difficultyOrder: Record<string, number> = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
            topicProblems.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

            for (let j = 0; j < topicProblems.length; j++) {
                const problem = topicProblems[j];
                
                // If it's the very first problem in the very first topic, unlock it.
                const isFirstProblem = i === 0 && j === 0;
                
                journeyProblems.push({
                    problemId: problem._id.toString(),
                    topicName: topic,
                    status: isFirstProblem ? 'unlocked' : 'locked',
                    order: globalProblemOrder++,
                    attempts: 0,
                    completedAt: null
                });
            }
        }

        const currentTopicName = journeyTopics.length > 0 ? journeyTopics[0].topicName : null;
        const currentProblemId = journeyProblems.length > 0 ? journeyProblems[0].problemId : null;

        const journey = new this.journeyModel({
            userId,
            goal,
            topics: journeyTopics,
            problems: journeyProblems,
            currentTopicName,
            currentProblemId,
            status: 'active'
        });

        return journey.save();
    }

    async getActiveJourney(userId: string) {
        return this.journeyModel.findOne({ userId, status: 'active' }).exec();
    }

    async checkProblemAccess(userId: string, problemId: string) {
        const journey = await this.getActiveJourney(userId);
        if (!journey) {
            return { isJourneyProblem: false, allowed: true };
        }

        const problemProgress = journey.problems.find(p => p.problemId === problemId);
        
        // If not in the active journey, it's a normal standalone problem
        if (!problemProgress) {
            return { isJourneyProblem: false, allowed: true };
        }

        // If in journey, check if unlocked or completed
        if (problemProgress.status === 'locked') {
            return {
                isJourneyProblem: true,
                allowed: false,
                status: 'locked',
                currentProblemId: journey.currentProblemId
            };
        }

        return {
            isJourneyProblem: true,
            allowed: true,
            status: problemProgress.status,
            currentProblemId: journey.currentProblemId
        };
    }

    async handleProblemCompleted(userId: string, problemId: string) {
        const journey = await this.getActiveJourney(userId);
        if (!journey) return;

        const problemIndex = journey.problems.findIndex(p => p.problemId === problemId);
        if (problemIndex === -1) return;

        const problem = journey.problems[problemIndex];

        // Increment attempts (optional logic: track all submissions, here just mark completion)
        if (problem.status !== 'completed') {
            problem.status = 'completed';
            problem.completedAt = new Date();
        }

        // Find next problem
        const nextProblemIndex = problemIndex + 1;
        let nextTopicName = null;

        if (nextProblemIndex < journey.problems.length) {
            const nextProblem = journey.problems[nextProblemIndex];
            if (nextProblem.status === 'locked') {
                nextProblem.status = 'unlocked';
            }
            journey.currentProblemId = nextProblem.problemId;
            journey.currentTopicName = nextProblem.topicName;
            nextTopicName = nextProblem.topicName;
        } else {
            journey.currentProblemId = null;
            journey.status = 'completed';
        }

        // Update topic statuses
        for (const topic of journey.topics) {
            const topicProbs = journey.problems.filter(p => p.topicName === topic.topicName);
            const allCompleted = topicProbs.length > 0 && topicProbs.every(p => p.status === 'completed');
            
            if (allCompleted) {
                topic.status = 'completed';
            } else if (topic.topicName === nextTopicName && topic.status === 'locked') {
                topic.status = 'unlocked';
            }
        }

        // Mark journey array as modified for mongoose
        journey.markModified('problems');
        journey.markModified('topics');

        await journey.save();
    }
}
