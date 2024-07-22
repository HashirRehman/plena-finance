import { Controller, Post, Param, Delete, Req } from '@nestjs/common';
import { BlockService } from './block.service';

@Controller('block')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  @Post(':id')
  async block(@Req() req, @Param('id') blockUserId: string) {
    const subjectId = req.user.id; // Extract user id from JWT token
    return this.blockService.blockUser(subjectId, blockUserId);
  }

  @Delete(':id')
  async unblock(@Req() req, @Param('id') blockUserId: string) {
    const subjectId = req.user.id; // Extract user id from JWT token
    return this.blockService.unblockUser(subjectId, blockUserId);
  }
}
