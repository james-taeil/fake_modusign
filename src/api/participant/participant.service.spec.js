import { ParticipantService } from './participant.service.js';

describe('ParticipantService', () => {
  let service;

  beforeEach(async () => {
    service = new ParticipantService(null);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
