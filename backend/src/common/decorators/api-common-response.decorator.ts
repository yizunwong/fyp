import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, getSchemaPath } from '@nestjs/swagger';
import { CommonResponseDto } from '../dto/common-response.dto';

export const ApiCommonResponse = <TModel extends Type<unknown>>(
  model: TModel,
  isArray = false,
  description = 'Success response',
) =>
  applyDecorators(
    ApiExtraModels(CommonResponseDto, model),
    ApiOkResponse({
      description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(CommonResponseDto) },
          {
            properties: {
              data: isArray
                ? { type: 'array', items: { $ref: getSchemaPath(model) } }
                : { $ref: getSchemaPath(model) },
            },
          },
        ],
      },
    }),
  );
