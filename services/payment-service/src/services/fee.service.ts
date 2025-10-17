export class FeeService {
  private readonly VIBE_PAY_FEE = 0.95
  private readonly OPENPIX_FEE = 0.85

  calculate(amount: number) {
    const vibepayFee = this.VIBE_PAY_FEE
    const netAmount = amount - vibepayFee
    const profit = vibepayFee - this.OPENPIX_FEE

    return {
      amount,
      vibepayFee,
      netAmount,
      profit,
      openpixCost: this.OPENPIX_FEE
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }
}