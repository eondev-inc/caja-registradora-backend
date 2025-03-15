import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateOpenRegisterDto {
    @ApiProperty({
        description: 'The initial amount of money in the register.',
        example: 1000,
    })
    @IsNumber()
    @IsPositive()
    initial_amount: number;
    
    @ApiProperty({
        description: 'The ID of the entity associated with the register.',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsString()
    @IsNotEmpty()
    entity_id: string;
}