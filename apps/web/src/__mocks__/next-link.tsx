import React from 'react'

type LinkProps = {
  href: string
  children: React.ReactNode
  className?: string
  [key: string]: unknown
}

const Link = ({ href, children, ...props }: LinkProps) =>
  React.createElement('a', { href, ...props }, children)

export default Link