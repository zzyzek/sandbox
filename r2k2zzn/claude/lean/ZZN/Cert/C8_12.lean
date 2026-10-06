import ZZN.WinBCD

namespace ZZN.Win

/-- Certificate for C12 (8 × 8 window), both colourings. -/
theorem cert_c8_12 : ∀ c : Bool, certify (winC ([(0, 1), (7, 0)], [(1, 1), (6, 0)])) (winC ([(0, 1), (7, 0)], [(1, 1), (6, 0)])) (tmC ([(0, 1), (7, 0)], [(1, 1), (6, 0)]) c) 0 none = true := by
  native_decide

end ZZN.Win
