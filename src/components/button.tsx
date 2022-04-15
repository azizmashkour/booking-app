import * as React from 'react'
import { Button as BootstrapBouton } from 'react-bootstrap'

export interface ButtonProps {
  onClick?: (() => void) | undefined
  children?: any
  variant?: string
  className?: string
}

export const Button = ({ onClick, children, variant='primary', className }: ButtonProps) => {
  return (
    <BootstrapBouton
      onClick={onClick}
      variant={variant}
      className={className}
    >
      {children}
    </BootstrapBouton>
  )
}
