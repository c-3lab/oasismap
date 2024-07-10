import React, { useState } from 'react'
import {
  Box,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
} from '@mui/material'
import {
  CheckCircle,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material'
import { Data } from '@/types/happiness-list-response'
import { timestampToDateTime } from '@/libs/date-converter'

interface ListTableProps {
  listData: Data[]
}

const Row = (props: { row: Data }) => {
  const { row } = props
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <TableRow
        sx={{
          '& > .MuiTableCell-root': {
            px: '0px',
            textAlign: 'center',
            borderBottom: 'unset',
          },
        }}
      >
        <TableCell sx={{ pl: '8px', width: '28px' }}>
          <IconButton
            aria-label={isOpen ? 'collapse row' : 'expand row'}
            size="small"
            onClick={() => setIsOpen(!isOpen)}
            sx={{ px: '0px' }}
          >
            {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell>
          {row.answers?.happiness1 ? <CheckCircle /> : null}
        </TableCell>
        <TableCell>
          {row.answers?.happiness2 ? <CheckCircle /> : null}
        </TableCell>
        <TableCell>
          {row.answers?.happiness3 ? <CheckCircle /> : null}
        </TableCell>
        <TableCell>
          {row.answers?.happiness4 ? <CheckCircle /> : null}
        </TableCell>
        <TableCell>
          {row.answers?.happiness5 ? <CheckCircle /> : null}
        </TableCell>
        <TableCell>
          {row.answers?.happiness6 ? <CheckCircle /> : null}
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={7}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <Box sx={{ m: 1 }}>
              <Typography variant="body2" gutterBottom>
                送信日時: {timestampToDateTime(row.timestamp)}
              </Typography>
              <Typography variant="body2" gutterBottom>
                緯度: {row.location?.value.coordinates[0].toString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                経度: {row.location?.value.coordinates[1].toString()}
              </Typography>
              <Typography variant="body2" gutterBottom>
                送信住所: {row.location?.place}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

const ListTable: React.FC<ListTableProps> = ({ listData }) => {
  return (
    <TableContainer
      component={Paper}
      // maxHeightの指定についてはヘッダーの高さ(64px)と親コンポーネントの上下パディング(64px)を差し引く
      sx={{
        maxHeight: 'calc(100vh - 64px - 64px)',
        border: '1px solid rgba(0, 0, 0, 0.12)',
      }}
    >
      <Table
        stickyHeader
        sx={{ px: '16px', tableLayout: 'fixed', width: '100%' }}
      >
        <TableHead>
          <TableRow
            sx={{
              '& > .MuiTableCell-root': {
                textAlign: 'center',
                overflowWrap: 'break-word',
                lineHeight: '1.2em',
              },
            }}
          >
            <TableCell sx={{ pl: '8px', width: '28px' }} />
            <TableCell>ワクワク</TableCell>
            <TableCell>学び</TableCell>
            <TableCell>ホッとする</TableCell>
            <TableCell>自分を取り戻せる</TableCell>
            <TableCell>自慢</TableCell>
            <TableCell>思い出</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {listData.map((row) => (
            <Row key={row.id} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

export default ListTable
