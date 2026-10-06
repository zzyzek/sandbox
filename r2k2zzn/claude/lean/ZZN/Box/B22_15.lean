import ZZN.Finite2

/-! The box 22 × 15, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_22_15 : (List.range 22).all (checkBoxC checkInst2 22 15) = true := by native_decide

end ZZN
