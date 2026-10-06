import ZZN.Finite2

/-! The box 21 × 14, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_21_14 : (List.range 21).all (checkBoxC checkInst2 21 14) = true := by native_decide

end ZZN
