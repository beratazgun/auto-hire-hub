import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { zxcvbn, zxcvbnAsync, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import { NextFunction } from 'express';

export function IsPasswordStrong(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPasswordStrong',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [
        {
          message: (constraints: ValidationArguments['constraints']) => {
            return constraints;
          },
        },
      ],
      options: validationOptions,
      validator: {
        async validate(value: string, args: ValidationArguments) {
          const options = {
            translations: zxcvbnEnPackage.translations,
            graphs: zxcvbnCommonPackage.adjacencyGraphs,
            dictionary: {
              ...zxcvbnCommonPackage.dictionary,
              ...zxcvbnEnPackage.dictionary,
            },
          };
          zxcvbnOptions.setOptions(options);

          const { score, feedback } = await zxcvbnAsync(value);

          if (score < 3) {
            args.constraints[0] =
              feedback.warning + ' ' + feedback.suggestions[0];
            return false;
          } else {
            return true;
          }
        },
      },
    });
  };
}
