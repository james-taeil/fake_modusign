import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '../../common/exceptions/index.js';
import { hashRounds } from '../../config.js';
import * as jwt from '../../lib/jwt';

