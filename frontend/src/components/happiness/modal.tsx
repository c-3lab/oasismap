import React, { useState } from 'react'
import { BarChart, XAxis, YAxis, Bar } from 'recharts'
import Pagination from '@mui/material/Pagination'
import { Modal, Box, Typography } from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { graphColors } from '@/theme/color'

interface ModalProps {
  data: any
  onClose: () => void
}
interface QuestionTitles {
  [key: string]: string
}
const questionTitles: QuestionTitles = {
  happiness1: 'ワクワクする場所',
  happiness2: '発見の学びの場所',
  happiness3: 'ホッとする場所',
  happiness4: '自分を取り戻せる場所',
  happiness5: '自慢の場所',
  happiness6: '思い出の場所',
}

export const OpenModal: React.FC<ModalProps> = ({ onClose, data }) => {
  let barChartData: any[] = []
  if (data !== null) {
    barChartData = [
      {
        questionTitle: questionTitles.happiness1,
        value: Math.floor(data.answer1 * 100),
      },
      {
        questionTitle: questionTitles.happiness2,
        value: Math.floor(data.answer2 * 100),
      },
      {
        questionTitle: questionTitles.happiness3,
        value: Math.floor(data.answer3 * 100),
      },
      {
        questionTitle: questionTitles.happiness4,
        value: Math.floor(data.answer4 * 100),
      },
      {
        questionTitle: questionTitles.happiness5,
        value: Math.floor(data.answer5 * 100),
      },
      {
        questionTitle: questionTitles.happiness6,
        value: Math.floor(data.answer6 * 100),
      },
    ]
  }
  const memosPerPage = 5
  const [currentPage, setCurrentPage] = useState(1)
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
  }
  return (
    <Modal open={!!data} onClose={onClose} aria-labelledby="modal-modal-title">
      <Box
        sx={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'auto',
          maxWidth: '90%',
          height: 'auto',
          maxHeight: '90%',
          overflow: 'auto',
          bgcolor: 'background.paper',
          border: '2px solid #000',
          boxShadow: 24,
          p: 4,
        }}
      >
        {data !== null && data.totalmemos === undefined && (
          <span>
            {data.answer1 > 0 && (
              <h3 style={{ color: '#007fff', display: 'flex' }}>
                <CheckCircleIcon
                  sx={{
                    marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
                    fontSize: {
                      xs: 'small',
                      sm: 'large',
                    },
                  }}
                />
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a>{questionTitles.happiness1}</a>
                </Typography>
              </h3>
            )}
            {data.answer1 === 0 && (
              <h3>
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a
                    style={{
                      color: '#007fff',
                      opacity: 0.3,
                      marginLeft: '18px',
                    }}
                  >
                    {questionTitles.happiness1}
                  </a>
                </Typography>
              </h3>
            )}
            {data.answer2 > 0 && (
              <h3 style={{ color: '#4BA724', display: 'flex' }}>
                <CheckCircleIcon
                  sx={{
                    marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
                    fontSize: {
                      xs: 'small',
                      sm: 'large',
                    },
                  }}
                />
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a>{questionTitles.happiness2}</a>
                </Typography>
              </h3>
            )}
            {data.answer2 === 0 && (
              <h3>
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a
                    style={{
                      color: '#4BA724',
                      opacity: 0.3,
                      marginLeft: '18px',
                    }}
                  >
                    {questionTitles.happiness2}
                  </a>
                </Typography>
              </h3>
            )}
            {data.answer3 > 0 && (
              <h3 style={{ color: '#7f00ff', display: 'flex' }}>
                <CheckCircleIcon
                  sx={{
                    marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
                    fontSize: {
                      xs: 'small',
                      sm: 'large',
                    },
                  }}
                />
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a>{questionTitles.happiness3}</a>
                </Typography>
              </h3>
            )}
            {data.answer3 === 0 && (
              <h3>
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a
                    style={{
                      color: '#7f00ff',
                      opacity: 0.3,
                      marginLeft: '18px',
                    }}
                  >
                    {questionTitles.happiness3}
                  </a>
                </Typography>
              </h3>
            )}
            {data.answer4 > 0 && (
              <h3 style={{ color: '#FF00D8', display: 'flex' }}>
                <CheckCircleIcon
                  sx={{
                    marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
                    fontSize: {
                      xs: 'small',
                      sm: 'large',
                    },
                  }}
                />
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a>{questionTitles.happiness4}</a>
                </Typography>
              </h3>
            )}
            {data.answer4 === 0 && (
              <h3>
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a
                    style={{
                      color: '#FF00D8',
                      opacity: 0.3,
                      marginLeft: '18px',
                    }}
                  >
                    {questionTitles.happiness4}
                  </a>
                </Typography>
              </h3>
            )}
            {data.answer5 > 0 && (
              <h3 style={{ color: '#ff7f00', display: 'flex' }}>
                <CheckCircleIcon
                  sx={{
                    marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
                    fontSize: {
                      xs: 'small',
                      sm: 'large',
                    },
                  }}
                />
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a>{questionTitles.happiness5}</a>
                </Typography>
              </h3>
            )}
            {data.answer5 === 0 && (
              <h3>
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a
                    style={{
                      color: '#ff7f00',
                      opacity: 0.3,
                      marginLeft: '18px',
                    }}
                  >
                    {questionTitles.happiness5}
                  </a>
                </Typography>
              </h3>
            )}
            {data.answer6 > 0 && (
              <h3 style={{ color: '#ff0000', display: 'flex' }}>
                <CheckCircleIcon
                  sx={{
                    marginTop: { xs: 0.3, sm: 0.3, md: 0.4, lg: 0.8 },
                    fontSize: {
                      xs: 'small',
                      sm: 'large',
                    },
                  }}
                />
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a>{questionTitles.happiness6}</a>
                </Typography>
              </h3>
            )}
            {data.answer6 === 0 && (
              <h3>
                <Typography
                  id="modal-modal-title"
                  sx={{
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  <a
                    style={{
                      color: '#ff0000',
                      opacity: 0.3,
                      marginLeft: '18px',
                    }}
                  >
                    {questionTitles.happiness6}
                  </a>
                </Typography>
              </h3>
            )}
            {data.memo !== undefined && (
              <label>
                <h3>
                  <Typography
                    id="modal-modal-title"
                    sx={{
                      marginTop: 2,
                      fontSize: {
                        xs: '0.75rem',
                        sm: '1rem',
                        md: '1.2rem',
                        lg: '1.3rem',
                      },
                    }}
                  >
                    {data.memo}
                  </Typography>
                </h3>
              </label>
            )}
            {data.basetime && (
              <label
                style={{
                  bottom: '10%',
                  right: '10px',
                }}
              >
                <Typography
                  id="modal-modal-title"
                  sx={{
                    marginTop: { xs: 4 },
                    display: 'flex',
                    justifyContent: 'flex-end',
                    fontSize: {
                      xs: '0.75rem',
                      sm: '1rem',
                      md: '1.2rem',
                      lg: '1.3rem',
                    },
                  }}
                >
                  回答日時：
                  {data.timestamp}
                </Typography>
              </label>
            )}
          </span>
        )}
        {data !== null && data.totalmemos !== undefined && (
          <>
            <BarChart
              data={barChartData}
              layout="vertical"
              barCategoryGap={1}
              margin={{ top: 0, right: 50, left: 0, bottom: 0 }}
              width={300}
              height={200}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis
                type="category"
                width={70}
                axisLine={false}
                tickLine={false}
                dataKey="questionTitle"
                tick={({ x, y, payload, index }) => {
                  const colors = graphColors
                  const color = colors[index % colors.length]
                  return (
                    <text
                      x={x}
                      y={y}
                      fill={color}
                      fontSize={12}
                      textAnchor="middle"
                    >
                      {payload.value}
                    </text>
                  )
                }}
              />
              <Bar
                dataKey="value"
                label={({ x, y, index }) => (
                  <text x={x + 57} y={y + 19} fill="black" fontSize={12}>
                    {barChartData[index].value}%
                  </text>
                )}
                barSize={28}
                shape={(props: any) => {
                  const { index } = props
                  const offset = 125
                  const colors = graphColors
                  return (
                    <rect
                      {...props}
                      x={offset}
                      fill={colors[index % colors.length]}
                      fillOpacity={0.5}
                    />
                  )
                }}
              />
            </BarChart>
            {data.memos !== undefined && (
              <>
                <hr style={{ marginTop: '10px' }}></hr>
                <h3 style={{ marginTop: '10px' }}>メモ一覧</h3>
                <div style={{ marginTop: '10px' }}>
                  {data.memos
                    .slice(
                      (currentPage - 1) * memosPerPage,
                      currentPage * memosPerPage
                    )
                    .map((title: string, index: number) => (
                      <div
                        style={{
                          display: 'flex',
                          marginTop: '2px',
                        }}
                        key={index}
                      >
                        ■
                        <a
                          style={{
                            fontSize: '12px',
                            marginTop: '5px',
                            marginLeft: '2px',
                          }}
                        >
                          {title}
                        </a>
                      </div>
                    ))}
                </div>
                <Pagination
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '10px',
                  }}
                  count={Math.ceil(data.memos.length / memosPerPage)}
                  color="primary"
                  page={currentPage}
                  boundaryCount={
                    Math.ceil(data.memos.length / memosPerPage) > 4 ? 1 : 0
                  }
                  siblingCount={
                    Math.ceil(data.memos.length / memosPerPage) > 4 ? 0 : 1
                  }
                  onChange={handlePageChange}
                />
              </>
            )}
          </>
        )}
      </Box>
    </Modal>
  )
}
