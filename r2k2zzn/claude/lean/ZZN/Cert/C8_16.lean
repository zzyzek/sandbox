import ZZN.WinBCD

namespace ZZN.Win

/-- Certificate for C16 (8 × 8 window), both colourings. -/
theorem cert_c8_16 : ∀ c : Bool, certify (winC ([(0, 6), (2, 1)], [(1, 2), (6, 0)])) (winC ([(0, 6), (2, 1)], [(1, 2), (6, 0)])) (tmC ([(0, 6), (2, 1)], [(1, 2), (6, 0)]) c) 0 none = true := by
  native_decide

end ZZN.Win
