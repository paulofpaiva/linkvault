import { Request, Response, NextFunction } from 'express';

declare global {
  namespace Express {
    interface Response {
      success: (data: any, message?: string) => void;
      error: (message: string, statusCode?: number) => void;
    }
  }
}

export const responseWrapper = (req: Request, res: Response, next: NextFunction): void => {
  res.success = function (data: any = null, message: string = 'Operation successful') {
    const response: any = {
      isSuccess: true,
      message,
    };
    
    if (data !== null) {
      response.data = data;
    }
    
    this.json(response);
  };

  res.error = function (message: string = 'Error in operation', statusCode: number = 400) {
    this.status(statusCode).json({
      isSuccess: false,
      message,
    });
  };

  next();
};

