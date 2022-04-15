import { useEffect, useState, Fragment } from 'react'
import { Cart } from './components/cart'
import * as Data from './Data'
import { StashPointsTable } from './components/stashpoints-table'
import {
  getInitialDraftCart,
  jsonFetch,
  ApiRequest,
  Unionize,
  isBagCountValid,
  isDateRangeValid,
  formatCurrency,
} from './util'
import { Quote } from './components/quote'
import { format } from 'date-fns'
import { Alert } from 'react-bootstrap'

export type AppProps = {
  readonly children?: never
}

export const App = (_props: AppProps) => {
  // --- Api Requests ---
  const [stashpointsReq, setStashpointsReq] = useState<
    ApiRequest<Data.Stashpoints>
  >({
    isLoading: true,
    isError: false,
  })
  const [priceQuoteReq, setQuoteReq] = useState<ApiRequest<Data.PriceQuote>>({
    isLoading: false,
    isError: false,
  })
  const [bookingReq, setBookingReq] = useState<ApiRequest<Data.Booking>>({
    isLoading: false,
    isError: false,
  })

  // ---- state ----
  const [cart, setCart] = useState<Data.DraftCart>(getInitialDraftCart)

  const handleUpdateCart = ({ key, value }: Unionize<Data.DraftCart>) => {
    switch (key) {
      case 'bagCount':
        if (isBagCountValid(value)) {
          setCart({
            ...cart,
            bagCount: value,
          })
        }
        return
      case 'dateRange':
        if (isDateRangeValid(value)) {
          setCart({
            ...cart,
            dateRange: value,
          })
        }
        return
    }
  }

  // ---- Effects ----
  // Fetch the list of available stashpoints on mount
  useEffect(() => {
    setStashpointsReq((req) => ({
      ...req,
      isLoading: true,
    }))
    jsonFetch<Data.Stashpoint[]>('/api/stashpoints').then((res) => {
      const [error, stashpoints] = Data.Stashpoints.decode(res)

      setStashpointsReq((req) => ({
        data: stashpoints,
        isLoading: false,
        isError: !!error,
        errorMessage: error?.message,
      }))
    })
  }, [])

  // get quotes on cart change
  useEffect(() => {
    if (cart.stashpointId) {
      // remove the previous booking request
      setBookingReq((req) =>
        req.data
          ? {
              ...req,
              data: undefined,
            }
          : req,
      )

      setQuoteReq((req) => ({
        ...req,
        isLoading: true,
      }))

      jsonFetch<Data.PriceQuote>(`/api/quotes`, {
        method: 'POST',
        body: JSON.stringify(
          Data.Cart.encode({ ...cart, stashpointId: cart.stashpointId }),
        ),
      }).then((res) => {
        const [error, quote] = Data.PriceQuote.decode(res)

        setQuoteReq((req) => ({
          data: quote,
          isLoading: false,
          isError: !!error,
          errorMessage: error?.message,
        }))
      }).catch((err) => {
        console.log('error', err);

      })
    } else {
      setQuoteReq((req) => ({
        ...req,
        data: undefined,
      }))
    }
  }, [cart])

  // book stashpoint on onPurchase
  const handlePurchase = () => {
    if (cart.stashpointId) {
      setBookingReq((req) => ({
        ...req,
        isLoading: true,
      }))

      jsonFetch<Data.Booking>(`/api/bookings`, {
        method: 'POST',
        body: JSON.stringify(
          Data.Cart.encode({
            ...cart,
            stashpointId: cart.stashpointId,
          }),
        ),
      }).then((res) => {
        const [error, booking] = Data.Booking.decode(res)
        console.log('booking', booking)
        // make a payment
        if (booking) {
          jsonFetch<Data.Payment>(`/api/payments`, {
            method: 'POST',
            body: JSON.stringify({
              bookingId: booking.id,
            }),
          }).then((res) => {
            const [error, payment] = Data.Payment.decode(res)

            console.log('payment', payment)

            setBookingReq((req) => ({
              data: booking,
              isLoading: false,
              isError: !!error,
              errorMessage: error?.message,
            }))
          })
        } else {
          setBookingReq((req) => ({
            data: booking,
            isLoading: false,
            isError: !!error,
            errorMessage: error?.message,
          }))
        }
      })
    }
  }

  return (
    <div>
      <header>
        <h1 className="text-center mb-5 fw-light fs-larger">Stasher Booking app</h1>
      </header>

      <main className="container">
        <div className="row g-5 mx-5 mb-5">
              {stashpointsReq.isLoading ? (
                <Fragment>
                  <div className="linear-activity">
                    <div className="indeterminate"></div>
                  </div>
                  <p className="text-center">Loading stashpoints...</p>
                </Fragment>
              ) : stashpointsReq.isError ? (
                <div>
                  <p>There was an error loading the stashpoints : </p>
                  <p>{stashpointsReq.errorMessage}</p>
                </div>
              ) : (
                <Fragment>
                    <div className="col-md-5 col-lg-4 order-md-last">
                      {bookingReq.isLoading ? (
                        <Fragment>
                          <div className="linear-activity">
                            <div className="indeterminate"></div>
                          </div>
                          <p>Booking stashpoint...</p>
                        </Fragment>
                      ) : bookingReq.isError ? (
                        <Fragment>
                          <p>There was an error booking the stashpoint : </p>
                          <p>{bookingReq.errorMessage}</p>
                        </Fragment>
                      ) : bookingReq.data ? (
                        <Fragment>
                          <Alert variant="success">
                            <div>
                              <span className="me-2">🎉</span> The Stashpoint <strong> '{bookingReq.data.stashpoint.name}' </strong> was successfully booked!
                            </div>
                          </Alert>
                          <h4>Booking Summary</h4>
                          <div className="d-flex align-items-center">
                            <p>
                              <p>
                                Your booking id is&nbsp;
                                <strong>{bookingReq.data.id}</strong>
                              </p>
                              <p>
                                Stashpoint:&nbsp;
                                <strong>{bookingReq.data.stashpoint.name}</strong>
                              </p>
                              <p>
                                From :&nbsp;
                                <strong>
                                  {format(bookingReq.data.dateRange.from, 'yyyy-MM-dd')}
                                </strong>
                              </p>
                              <p>
                                To :&nbsp;
                                <strong>
                                  {format(bookingReq.data.dateRange.from, 'yyyy-MM-dd')}
                                </strong>
                              </p>
                              <p>
                                Bag Count:&nbsp;
                                <strong>{bookingReq.data.bagCount}</strong>
                              </p>
                              <p>
                                Total price : &nbsp;
                                <strong>
                                  {formatCurrency(
                                    bookingReq.data.totalPrice,
                                    bookingReq.data.currencyCode,
                                  )}
                                </strong>
                              </p>
                            </p>
                          </div>
                        </Fragment>
                      ) : (
                        <Fragment>
                          <Cart {...cart} onUpdateCart={handleUpdateCart} />

                          {cart.stashpointId &&
                            (priceQuoteReq.isLoading ? (
                              <p>Loading quote...</p>
                            ) : priceQuoteReq.isError ? (
                              <div>
                                <p>There was an error loading the quote : </p>
                                <p>{priceQuoteReq.errorMessage}</p>
                              </div>
                            ) : (
                              priceQuoteReq.data && (
                                <Quote
                                  quote={priceQuoteReq.data}
                                  onPurchase={handlePurchase}
                                />
                              )
                            ))}
                        </Fragment>
                      )}
                    </div>
                    <div className="col-md-7 col-lg-8">
                      {stashpointsReq.data && (
                        <StashPointsTable
                          stashpoints={stashpointsReq.data}
                          selectedStashpointId={cart.stashpointId}
                          onSelectStashPoint={(stashpoint) => {
                            setCart((cart) => ({
                              ...cart,
                              stashpointId: stashpoint?.id,
                            }))
                          }}
                        />
                      )}
                    </div>
                </Fragment>
              )}
            </div>
      </main>
    </div>
  )
}
