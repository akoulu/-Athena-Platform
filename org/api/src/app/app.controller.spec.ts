import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let mockAppService: {
    getData: jest.Mock;
  };

  beforeEach(async () => {
    mockAppService = {
      getData: jest.fn().mockReturnValue({ message: 'Hello API' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
    (controller as any).appService = mockAppService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getData', () => {
    it('should return "Hello API"', () => {
      const result = controller.getData();
      expect(result).toEqual({ message: 'Hello API' });
      expect(mockAppService.getData).toHaveBeenCalled();
    });
  });
});
