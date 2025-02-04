import React, { useState } from 'react'
import Pagination from '@mui/material/Pagination'
import { Modal, Box } from '@mui/material'
import { Pin } from '@/types/pin'
import { HappinessAllGraph } from './happiness-all-graph'

interface ModalProps {
  data: Pin | null
  onClose: () => void
}

const MEMOS_PER_PAGE = 4

export const AllModal: React.FC<ModalProps> = ({ onClose, data }) => {
  const [currentPage, setCurrentPage] = useState(1)

  if (data === null) {
    return
  }
  if (data.memos === undefined) {
    return
  }

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }
  const filteredMemos = data.memos.filter((item) => item.memo)

  const pageCount = Math.ceil(filteredMemos.length / MEMOS_PER_PAGE)

  return (
    <Modal open={!!data} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '90%',
          maxHeight: '90%',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        <HappinessAllGraph data={data} />
        {data.memos !== undefined && (
          <>
            <hr style={{ marginTop: '5px' }}></hr>
            <p style={{ marginTop: '5px', fontSize: '18px' }}>メモ一覧</p>
            <div
              style={{ marginTop: '5px', height: '220px', fontSize: '12px' }}
            >
              {filteredMemos
                .slice(
                  (currentPage - 1) * MEMOS_PER_PAGE,
                  currentPage * MEMOS_PER_PAGE
                )
                .map(({ timestamp, memo }, index: number) => (
                  <div
                    key={index}
                    style={{
                      marginTop: '10px',
                      display: 'flex',
                    }}
                  >
                    ・
                    <div>
                      <div>{memo}</div>
                      <div>{timestamp}</div>
                    </div>
                  </div>
                ))}
            </div>
            <Pagination
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '20px',
              }}
              count={pageCount}
              color="primary"
              page={currentPage}
              boundaryCount={pageCount > 4 ? 1 : 0}
              siblingCount={pageCount > 4 ? 0 : 1}
              onChange={handlePageChange}
            />
          </>
        )}
      </Box>
    </Modal>
  )
}
