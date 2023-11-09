export interface CarImageMulterFileInterface {
  frontSide: Express.Multer.File[];
  backSide: Express.Multer.File[];
  rightSide: Express.Multer.File[];
  leftSide: Express.Multer.File[];
  inside: Express.Multer.File[];
}
