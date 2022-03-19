import winston from "winston";

export enum levels {
  error= 0,
  warn= 1,
  info= 2,
  http= 3,
  verbose= 4,
  debug= 5,
  silly= 6
};

export default function generateWinstonLogger(level: levels, serviceName: string) {
  const logger = winston.createLogger({
    level: levels[level],
    format: winston.format.json(),
    defaultMeta: { service: serviceName || 'user-service' },
    transports: [
      new winston.transports.Console(),
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });
  
  if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: winston.format.simple(),
    }));
  }

  return logger
}