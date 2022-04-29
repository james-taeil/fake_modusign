import { NotFoundException } from '../../common/exceptions/index.js';
import * as jwt from '../../lib/jwt.js';

const disableStatuses = Object.freeze(['CREATED', 'DELETED']);

export class ParticipantService {
  constructor(participantRepository) {
    this.participantRepository = participantRepository
  }

  issueAccessToken({ documentId, email }){
    const participant = this.participantRepository.findByDocumentIdAndEmail(
      documentId,
      email,
    );

    if (!participant || disableStatuses.includes(participant.status)) {
      throw new NotFoundException('참가자 정보를 찾을 수 없습니다.');
    }

    const token = jwt.sign({
      participant_id: participant.id,
      email: participant.email,
    });

    return [ 
      token,
      participant.toJson(),
    ];
  }
}
