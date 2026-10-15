import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DsaJourneyController } from './dsa-journey.controller';
import { DsaJourneyService } from './dsa-journey.service';
import { DsaJourney, DsaJourneySchema } from './schemas/dsa-journey.schema';
import { ProblemsModule } from '../problems/problems.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: DsaJourney.name, schema: DsaJourneySchema }]),
        ProblemsModule
    ],
    controllers: [DsaJourneyController],
    providers: [DsaJourneyService],
    exports: [DsaJourneyService]
})
export class DsaJourneyModule {}
