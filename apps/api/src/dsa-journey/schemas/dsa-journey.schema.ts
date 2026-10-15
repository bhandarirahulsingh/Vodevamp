import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type DsaJourneyDocument = DsaJourney & Document;

@Schema()
export class TopicProgress {
    @Prop({ required: true })
    topicName: string;

    @Prop({ required: true, enum: ['locked', 'unlocked', 'completed'] })
    status: string;

    @Prop({ required: true })
    order: number;
}

@Schema()
export class ProblemProgress {
    @Prop({ type: String, required: true })
    problemId: string;

    @Prop({ required: true })
    topicName: string;

    @Prop({ required: true, enum: ['locked', 'unlocked', 'completed'] })
    status: string;

    @Prop({ required: true })
    order: number;

    @Prop({ default: 0 })
    attempts: number;

    @Prop({ type: Date, default: null })
    completedAt: Date | null;
}

@Schema({ timestamps: true })
export class DsaJourney {
    @Prop({ required: true })
    userId: string;

    @Prop({ default: 'Placement Preparation' })
    goal: string;

    @Prop({ type: [SchemaFactory.createForClass(TopicProgress)], default: [] })
    topics: TopicProgress[];

    @Prop({ type: [SchemaFactory.createForClass(ProblemProgress)], default: [] })
    problems: ProblemProgress[];

    @Prop({ type: String, default: null })
    currentTopicName: string | null;

    @Prop({ type: String, default: null })
    currentProblemId: string | null;

    @Prop({ required: true, enum: ['active', 'completed'], default: 'active' })
    status: string;
}

export const DsaJourneySchema = SchemaFactory.createForClass(DsaJourney);
