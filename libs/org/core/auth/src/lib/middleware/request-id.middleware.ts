import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request interface
interface RequestWithId extends Request {
  id?: string;
}

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, res: Response, next: NextFunction): void {
    // Use existing request ID from header or generate new one
    req.id = (req.headers['x-request-id'] as string) || uuidv4();
    
    // Set response header with request ID
    res.setHeader('X-Request-ID', req.id);
    
    next();
  }
}
