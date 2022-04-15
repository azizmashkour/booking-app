import { Fragment } from 'react'
import * as Data from '../Data'
import { format, startOfDay } from 'date-fns'
import { Unionize } from '../util'

export interface CartProps extends Data.DraftCart {
  onUpdateCart?: ({ key, value }: Unionize<Data.DraftCart>) => void
}

export const Cart = ({
  bagCount,
  dateRange: { from, to },
  onUpdateCart,
  stashpointId,
}: CartProps) => {
  return (
    <Fragment>
      {!stashpointId ? (
        <h3 className="text-center">
          Select a stashpoint to get a quote.
        </h3>
      ) : (
        <Fragment>
          <h4 className="d-flex justify-content-between align-items-center mb-3">
            <span className="text-primary">Add new reservation</span>
          </h4>
          <div className="d-flex gap-3 mt-3">
            <form className="card p-2">
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-12">
                    <label htmlFor="bagCount" className="form-label">Bag Count</label>
                    <input
                      name='bagCount'
                      className='form-control'
                      type='number'
                      placeholder='bag count'
                      min={1}
                      max={50}
                      value={bagCount}
                      onChange={(e) =>
                        onUpdateCart?.({
                          key: 'bagCount',
                          value: parseInt(e.target.value, 10),
                        })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="from" className="form-label">From</label>
                    <input
                      name="from"
                      className="form-control"
                      type='date'
                      value={format(from, 'yyyy-MM-dd')}
                      onChange={(e) =>
                        onUpdateCart?.({
                          key: 'dateRange',
                          value: {
                            from: startOfDay(new Date(e.target.value)),
                            to,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="col-12">
                    <label htmlFor="to" className="form-label">To</label>
                    <input
                      name="to"
                      className="form-control"
                      type='date'
                      value={format(to, 'yyyy-MM-dd')}
                      onChange={(e) =>
                        onUpdateCart?.({
                          key: 'dateRange',
                          value: {
                            from,
                            to: startOfDay(new Date(e.target.value)),
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </Fragment>
      )}
    </Fragment>
  )
}
