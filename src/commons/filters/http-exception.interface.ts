export interface HttpError {
  statusCode: number;
  timestamp: string;
  method: string;
  path: any;
  message?: string;
  error?: any;
  trace_id: string;
}
