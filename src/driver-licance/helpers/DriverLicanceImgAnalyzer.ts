import { BloodGroups } from '@src/core/enums/BloodGroups.enum';
import ImageAnalyzer from '../../core/libs/ImageAnalyzer';

interface IImageAnalyzer {
  frontSide?: Express.Multer.File[];
  backSide?: Express.Multer.File[];
}

export interface ImageFrontSideData {
  firstName: string;
  lastName: string;
  bornDate: string;
  bornPlace: string;
  driversLicanseDate: string;
  licenceValidityPeriod: string;
  identityNumber: string;
}

export interface ImageBackSideData {
  bloodGroup: string;
}

class DriverLicanceImgAnalyzer extends ImageAnalyzer {
  constructor(public files: IImageAnalyzer) {
    super();
  }

  async getRequiredData() {
    const frontSideData = await this.getFrontSideData();
    const backSideData = await this.getBackSideData();

    return {
      ...frontSideData,
      ...backSideData,
    };
  }

  private async getBackSideData() {
    const backSideData: ImageBackSideData = {
      bloodGroup: '',
    };

    const result = await this.analyzeImage(this.files.backSide[0].path);
    let arrResult = result.split('\n').slice(0, 1);

    const bloodGroup = arrResult[0].split(' ');
    backSideData.bloodGroup =
      BloodGroups[bloodGroup[1]] ?? bloodGroup[1] === '0Rh+'
        ? '0 rh+'
        : '0 rh-';

    return backSideData;
  }

  private async getFrontSideData() {
    const result = await this.analyzeImage(this.files.frontSide[0].path);
    let arrResult = result.split('\n').slice(2, 7);
    const frontSideData: ImageFrontSideData = {
      firstName: '',
      lastName: '',
      bornDate: '',
      bornPlace: '',
      driversLicanseDate: '',
      licenceValidityPeriod: '',
      identityNumber: '',
    };

    arrResult.forEach((item, index) => {
      const splittedItem = item.split(' ');
      if (index < 2) {
        index === 0
          ? (frontSideData.lastName = splittedItem[1].toLowerCase())
          : (frontSideData.firstName = splittedItem[1].toLowerCase());
      } else if (index === 2) {
        frontSideData.bornDate = splittedItem[1];
        frontSideData.bornPlace = splittedItem[2].toLowerCase();
      } else if (index === 3) {
        frontSideData.driversLicanseDate = splittedItem[0].slice(3);
      } else if (index === 4) {
        frontSideData.licenceValidityPeriod = splittedItem[0].slice(3);
        frontSideData.identityNumber = splittedItem[2];
      }
    });

    return frontSideData;
  }
}

export default DriverLicanceImgAnalyzer;
