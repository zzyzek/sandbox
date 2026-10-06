import ZZN.Finite2

/-! The box 22 × 21, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_22_21 : (List.range 22).all (checkBoxC checkInst2 22 21) = true := by native_decide

end ZZN
