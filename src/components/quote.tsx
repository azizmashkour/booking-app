import { Fragment } from 'react'
import * as Data from '../Data'
import { formatCurrency } from '../util'
import { Button } from './button'

export interface QuoteProps {
  quote: Data.PriceQuote
  onPurchase?: () => void
}

export const Quote = ({ quote, onPurchase }: QuoteProps) => {
  return (
    <Fragment>
      <div className="d-flex items-center mt-3">
        <h4>
          Total cost :&nbsp;
        </h4>
        <strong className="font-bold text-success ms-auto">
          {formatCurrency(quote.totalPrice, quote.currencyCode)}
        </strong>
      </div>
      <div className="text-end mt-2">
        <Button onClick={onPurchase} variant='primary'>
          Pay booking
        </Button>
      </div>
    </Fragment>
  )
}
