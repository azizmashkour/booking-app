import { Fragment, useState, useMemo } from 'react'
import * as Data from '../Data'
import { formatCurrency, Unionize } from '../util'
import { Badge } from 'react-bootstrap'
import { Button } from './button'

export interface StashPointTableProps {
  readonly stashpoints: Data.Stashpoints
  onSelectStashPoint?: (stashpoint: Data.Stashpoint | null) => void
  selectedStashpointId?: string | undefined
}

export const StashPointsTable = ({
  stashpoints,
  onSelectStashPoint,
  selectedStashpointId,
}: StashPointTableProps) => {

  const [filter, setFilter] = useState<Data.Filter>({
    property: 'rating',
    order: 'asc',
  })

  const handleChangeFilter = ({ key, value }: Unionize<Data.Filter>) => {
    setFilter({
      ...filter,
      [key]: value,
    })
  }

  const filteredStashpoints = useMemo(() => {
    switch (filter.property) {
      case 'rating':
        // we copy the stashpoints array to avoid mutating the original
        return [...stashpoints].sort((a, b) => {
          if (filter.order === 'asc') {
            return a.rating - b.rating
          }
          return b.rating - a.rating
        })
      case 'bagPerDayPrice':
        // we copy the stashpoints array to avoid mutating the original
        return [...stashpoints].sort((a, b) => {
          if (filter.order === 'asc') {
            return Number(a.bagPerDayPrice - b.bagPerDayPrice)
          }
          return Number(b.bagPerDayPrice - a.bagPerDayPrice)
        })
      default:
        return stashpoints
    }
  }, [filter, stashpoints])

  return (
    <Fragment>
      <h2 className="mb-5">List of Available Stashpoints</h2>
      <div className="row mb-3">
        <label htmlFor="filter">
          Filter by <strong>price</strong> and <strong>rate</strong>.
        </label>
        <div className="col-md-6 d-flex align-items-center">
          <select
            value={filter.property}
            className="form-control"
            onChange={(e) => {
              handleChangeFilter({
                key: 'property',
                value: e.target.value as Data.Filter['property'],
              })
            }}
          >
            <option value='rating'>Rating</option>
            <option value='bagPerDayPrice'>Bag Per Day Price</option>
          </select>
          &nbsp;
          <Button
            onClick={() =>
              handleChangeFilter({
                key: 'order',
                value: filter.order === 'asc' ? 'desc' : 'asc',
              })
            }
          >
            {filter.order === 'asc' ? '↓' : '↑'}
          </Button>
        </div>
        {selectedStashpointId ? (
          <div className="ms-auto col-md-3 align-items-center d-flex">
            <Button className="p-1 text-dark border-0 ms-auto hover-underligned" variant="outline-light" onClick={() => onSelectStashPoint?.(null)}>
              <Badge bg="light" text="dark" className="px-1 me-2">
                <span>&#10005;</span>
              </Badge>
              <span>Clear Selection</span>
            </Button>
          </div>
        ) : null}
      </div>

      <div className="list-group">
        {filteredStashpoints.map((stashpoint) => (
          <Fragment>
            <div
              key={stashpoint.id}
              onClick={() => onSelectStashPoint?.(stashpoint)}
              className={`${selectedStashpointId === stashpoint.id ? 'bg-light fw-bold text-primary' : 'fw-normal text-dark'} list-group-item d-flex justify-content-between align-items-start cursor-pointer`}
            >
            <div className="ms-2 me-auto">
              {selectedStashpointId === stashpoint.id ? <span className="me-2"> ✅ </span> : null }
              {stashpoint.name} -&nbsp;
              {formatCurrency(
                stashpoint.bagPerDayPrice,
                stashpoint.currencyCode,
              )}
              <sub>
                <Badge bg="light" text="dark">
                  bag/day
                </Badge>
              </sub>
              <br/><small>{stashpoint.address}</small>
            </div>
                 <span className="badge bg-light text-secondary"> Rating {stashpoint.rating}</span>
            </div>
          </Fragment>
        ))}
      </div>
    </Fragment>
  )
}
