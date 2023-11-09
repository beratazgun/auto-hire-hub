import { BadRequestException } from '@nestjs/common';
import { NextFunction } from 'express';
import { PrismaService } from '@src/core/services/prisma/prisma.service';

interface PaginationFieldsInterface {
  limit: number;
  skip: number;
  page: number;
  nextPage: number | null;
  prevPage: number;
  totalLength: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export class Filter {
  public lastVersionOfQueries: {
    [key: string]: any;
  } = {};

  constructor(
    public queries: any,
    public next: NextFunction,
    public prisma: PrismaService,
  ) {}

  public modifeQueries() {
    return {
      ...this.setUpperAndLowerValueFields(),
      ...this.otherQueries(),
      ...this.sorting(),
    };
  }

  public async pagination() {
    let paginationDatas: PaginationFieldsInterface = {
      limit: 0,
      skip: 0,
      page: 0,
      nextPage: 0,
      prevPage: 0,
      totalLength: 0,
      totalPages: 0,
      currentPage: 0,
      hasNextPage: false,
      hasPrevPage: false,
    };

    const totalDocsLength = (await this.prisma.car.findMany()).length;
    const page = Number(this.queries.page) || 1;
    const limit = Number(this.queries.limit) || 100;
    const skip = (page - 1) * limit;

    paginationDatas['skip'] = skip;
    paginationDatas['page'] = page;
    paginationDatas['limit'] = limit;
    paginationDatas['totalLength'] = totalDocsLength;
    paginationDatas['totalPages'] = Math.ceil(totalDocsLength / limit);
    paginationDatas['currentPage'] = page;
    paginationDatas['hasNextPage'] = paginationDatas['totalPages'] > page;
    paginationDatas['hasPrevPage'] = page > 1;
    paginationDatas['nextPage'] = paginationDatas['hasNextPage']
      ? page + 1
      : null;
    paginationDatas['prevPage'] = page === 1 ? 1 : page - 1;

    this.lastVersionOfQueries['pagination'] = paginationDatas;

    return this.lastVersionOfQueries;
  }

  private setUpperAndLowerValueFields() {
    const topAndBottomFields = [
      'price',
      'horsePower',
      'pricePerMin',
      'pricePerDay',
      'fuelPrice',
      'fuelLevel',
      'year',
    ];

    for (const iterator of Object.keys(this.queries)) {
      if (topAndBottomFields.includes(iterator)) {
        if (!this.queries[iterator].includes('-')) {
          const value = Number(this.queries[iterator]);

          this.lastVersionOfQueries[iterator] = {
            lte: value,
            gte: value,
          };
        } else {
          const splitValue = this.queries[iterator].split('-');

          if (Number(splitValue[0]) > Number(splitValue[1])) {
            this.next(
              new BadRequestException(
                'First value should be greater then second value.',
              ),
            );
          }

          this.lastVersionOfQueries[iterator] = {
            gte: Number(splitValue[0]),
            lte: Number(splitValue[1]),
          };
        }
      }
    }

    return this.lastVersionOfQueries;
  }

  private otherQueries() {
    const otherQueryFields = ['brand', 'transmission', 'model'];

    for (const iterator of Object.keys(this.queries)) {
      if (otherQueryFields.includes(iterator)) {
        this.lastVersionOfQueries[iterator] = this.queries[iterator];
      }
    }

    return this.lastVersionOfQueries;
  }

  private sorting() {
    const sortOptions = {
      PRİCEPM_BY_ASC: { pricePerMin: 'asc' },
      PRİCEPM_BY_DESC: { pricePerMin: 'desc' },
      PRİCEPD_BY_ASC: { pricePerDay: 'asc' },
      PRİCEPD_BY_DESC: { pricePerDay: 'desc' },
      MOST_RECENT: { createdAt: 'asc' },
      HORSEPOWER_BY_ASC: { horsePower: 'asc' },
      HORSEPOWER_BY_DESC: { horsePower: 'desc' },
      FUELLEVEL_BY_ASC: { fuelLevel: 'asc' },
      FUELLEVEL_BY_DESC: { fuelLevel: 'desc' },
    };

    if (this.queries['sort']) {
      this.lastVersionOfQueries['sort'] = sortOptions[this.queries['sort']];
    }

    return this.lastVersionOfQueries;
  }
}
