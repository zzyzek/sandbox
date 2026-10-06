import ZZN.Finite2

/-! The box 22 × 19, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_22_19 : (List.range 22).all (checkBoxC checkInst2 22 19) = true := by native_decide

end ZZN
