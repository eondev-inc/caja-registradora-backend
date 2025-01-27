export class CreateOpenRegisterDto {
    // The ID of the cashier who opened the register.
    cashier_id: string;
    // The amount of money in the register when it was opened.
    initial_amount: number;
}