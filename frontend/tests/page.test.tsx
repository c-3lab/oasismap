import { render } from '@testing-library/react'
import Home from '../src/app/page'
import { useRouter } from 'next/navigation'

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

describe('Home', () => {
  it('redirects to /login on mount', () => {
    const pushMock = jest.fn() // router.pushをモック
    ;(useRouter as jest.Mock).mockReturnValue({ push: pushMock }) // useRouterのモックにpushを追加

    render(<Home />)

    expect(pushMock).toHaveBeenCalledWith('/login') // /loginにリダイレクトしたか
    expect(pushMock).toHaveBeenCalledTimes(1) // 呼び出し回数
  })
})
