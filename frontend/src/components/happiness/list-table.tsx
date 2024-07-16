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
  DeleteForever,
} from '@mui/icons-material'
import { Data } from '@/types/happiness-list-response'
import { timestampToDateTime } from '@/libs/date-converter'
import DeleteConfirmationDialog from '@/components/happiness/delete-confirmation-dialog'

interface ListTableProps {
  listData: Data[]
  deleteListData: (id: string) => void
}

interface RowProps {
  row: Data
  openDialog: (row: Data) => void
}

const Row: React.FC<RowProps> = ({ row, openDialog }) => {
  const [isCollapseOpen, setIsCollapseOpen] = useState(false)

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
            aria-label={isCollapseOpen ? 'collapse row' : 'expand row'}
            size="small"
            onClick={() => setIsCollapseOpen(!isCollapseOpen)}
            sx={{ px: '0px' }}
          >
            {isCollapseOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
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
        <TableCell>
          <IconButton onClick={() => openDialog(row)}>
            <DeleteForever sx={{ color: 'black' }} />
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell sx={{ py: 0 }} colSpan={8}>
          <Collapse in={isCollapseOpen} timeout="auto" unmountOnExit>
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
              <Typography variant="body2" gutterBottom>
                メモ: {row.memo}
              </Typography>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  )
}

const ListTable: React.FC<ListTableProps> = ({ listData, deleteListData }) => {
  const [selectedData, setSelectedData] = useState<Data | null>(null)

  const deleteRowData = () => {
    if (selectedData) {
      deleteListData(selectedData.id)
      setSelectedData(null)
    }
  }

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
            <TableCell sx={{ width: '28px' }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {listData.map((row) => (
            <Row
              key={row.id}
              row={row}
              openDialog={() => setSelectedData(row)}
            />
          ))}
        </TableBody>
      </Table>
      <DeleteConfirmationDialog
        data={selectedData}
        onClose={() => setSelectedData(null)}
        deleteRowData={deleteRowData}
      />
    </TableContainer>
  )
}

export default ListTable
