import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { DsaJourneyService } from './dsa-journey.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('dsa-journey')
export class DsaJourneyController {
    constructor(private readonly dsaJourneyService: DsaJourneyService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    async createJourney(@Body('topics') topics: string[], @Body('goal') goal: string, @Req() req: any) {
        return this.dsaJourneyService.createJourney(req.user.userId, topics, goal);
    }

    @UseGuards(JwtAuthGuard)
    @Get('current')
    async getActiveJourney(@Req() req: any) {
        const journey = await this.dsaJourneyService.getActiveJourney(req.user.userId);
        return journey || { status: 'no_active_journey' };
    }

    @UseGuards(JwtAuthGuard)
    @Get('problem/:problemId/access')
    async checkProblemAccess(@Param('problemId') problemId: string, @Req() req: any) {
        return this.dsaJourneyService.checkProblemAccess(req.user.userId, problemId);
    }
}
