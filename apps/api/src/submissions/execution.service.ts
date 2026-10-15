import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExecutionService {
    constructor(private readonly configService: ConfigService) { }

    private readonly PISTON_URL = 'https://emkc.org/api/v2/piston/execute';
    private readonly DEFAULT_JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com';

    private readonly LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
        python: { language: 'python', version: '3.10.0' },
        cpp: { language: 'cpp', version: '10.2.0' },
        java: { language: 'java', version: '15.0.2' },
        go: { language: 'go', version: '1.16.2' },
        javascript: { language: 'javascript', version: '18.15.0' },
        c: { language: 'c', version: '10.2.0' },
    };

    private readonly JUDGE0_LANGUAGE_MAP: Record<string, number> = {
        c: 50,
        cpp: 54,
        java: 62,
        javascript: 63,
        python: 71,
        go: 60,
    };

    async execute(code: string, language: string, testCases: { input: string; expectedOutput: string }[]) {
        const provider = (this.configService.get<string>('EXECUTOR_PROVIDER', 'piston') || 'piston').toLowerCase();

        if (provider === 'judge0') {
            return this.executeWithJudge0(code, language, testCases);
        }

        return this.executeWithPiston(code, language, testCases);
    }

    private async executeWithPiston(code: string, language: string, testCases: { input: string; expectedOutput: string }[]) {
        const config = this.LANGUAGE_MAP[language];
        if (!config) {
            return { results: [{ passed: false, error: `Unsupported language: ${language}` }] };
        }

        const results: any[] = [];

        for (const testCase of testCases) {
            try {
                const response = await axios.post(this.PISTON_URL, {
                    language: config.language,
                    version: config.version,
                    files: [{ content: code }],
                    stdin: testCase.input,
                });

                const output = response.data.run;
                const actualOutput = output.stdout.trim();
                const expectedOutput = testCase.expectedOutput.trim();
                const passed = actualOutput === expectedOutput;

                results.push({
                    passed,
                    input: testCase.input,
                    actualOutput,
                    expectedOutput,
                    stderr: output.stderr,
                    stdout: output.stdout,
                    error: output.stderr ? 'Runtime Error' : null,
                    time: 0, // Piston doesn't give exact time easily
                });
            } catch (error) {
                results.push({
                    passed: false,
                    error: `Execution failed: ${error.message}`,
                });
            }
        }

        return { results };
    }

    private async executeWithJudge0(code: string, language: string, testCases: { input: string; expectedOutput: string }[]) {
        const languageId = this.JUDGE0_LANGUAGE_MAP[language];
        if (!languageId) {
            return { results: [{ passed: false, error: `Unsupported language: ${language}` }] };
        }

        const judge0Url = (this.configService.get<string>('JUDGE0_URL') || this.DEFAULT_JUDGE0_URL).replace(/\/$/, '');
        const rapidApiKey = this.configService.get<string>('JUDGE0_API_KEY');
        const rapidApiHost = this.configService.get<string>('JUDGE0_API_HOST');
        const authToken = this.configService.get<string>('JUDGE0_AUTH_TOKEN');

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (rapidApiKey) {
            headers['X-RapidAPI-Key'] = rapidApiKey;
            headers['X-RapidAPI-Host'] = rapidApiHost || 'judge0-ce.p.rapidapi.com';
        }
        if (authToken) {
            headers['X-Auth-Token'] = authToken;
        }

        const results: any[] = [];

        for (const testCase of testCases) {
            try {
                const response = await axios.post(
                    `${judge0Url}/submissions?base64_encoded=false&wait=true`,
                    {
                        language_id: languageId,
                        source_code: code,
                        stdin: testCase.input,
                    },
                    { headers },
                );

                const output = response.data || {};
                const actualOutput = (output.stdout || '').trim();
                const expectedOutput = testCase.expectedOutput.trim();
                const stderr = output.stderr || output.compile_output || '';
                const passed = actualOutput === expectedOutput;

                results.push({
                    passed,
                    input: testCase.input,
                    actualOutput,
                    expectedOutput,
                    stderr,
                    stdout: output.stdout || '',
                    error: stderr ? 'Runtime Error' : null,
                    time: output.time ? Number(output.time) * 1000 : 0,
                });
            } catch (error: any) {
                results.push({
                    passed: false,
                    input: testCase.input,
                    error: `Execution failed: ${error?.response?.status || ''} ${error?.response?.data?.message || error.message}`.trim(),
                });
            }
        }

        return { results };
    }
}
