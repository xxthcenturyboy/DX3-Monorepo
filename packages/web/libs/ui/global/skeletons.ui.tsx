// import React from 'react';
import { Box, ListItem, Skeleton } from '@mui/material'

const getArrayOfLength = (len: number): number[] => {
  const array: number[] = []
  for (let i = 0; i < len; i += 1) {
    array.push(i)
  }

  return array
}

const listSkeleton = (numItems: number, height: string): JSX.Element => {
  const listItems = getArrayOfLength(numItems)
  return (
    <>
      {listItems.map((item) => {
        return (
          <ListItem key={item}>
            <Skeleton
              animation="wave"
              style={{ height, width: '100%' }}
              variant="rectangular"
            />
          </ListItem>
        )
      })}
    </>
  )
}

const boxSkeleton = (padding: string, height: string): JSX.Element => {
  return (
    <Box
      padding={padding}
      style={{ width: '100%' }}
    >
      <Skeleton
        animation="wave"
        style={{ height }}
        variant="rectangular"
      />
    </Box>
  )
}

const waveItem = (height: string): JSX.Element => {
  return (
    <Skeleton
      animation="wave"
      style={{ height, width: '100%' }}
      variant="rectangular"
    />
  )
}

export { boxSkeleton, listSkeleton, waveItem }
