import { describe, expect, it } from 'vitest'
import { sum } from './math'

describe('sum', () => {
  it('空配列を渡すと 0 を返す', () => {
    expect(sum([])).toBe(0)
  })

  it('[1,2,3] を渡すと 6 を返す', () => {
    expect(sum([1, 2, 3])).toBe(6)
  })

  it('負数を含む配列も正しく合計する', () => {
    expect(sum([-1, 2, -3])).toBe(-2)
  })
})
