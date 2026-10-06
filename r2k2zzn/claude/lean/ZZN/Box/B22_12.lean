import ZZN.Finite2

/-! The box 22 × 12, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_22_12 : (List.range 22).all (checkBoxC checkInst2 22 12) = true := by native_decide

end ZZN
