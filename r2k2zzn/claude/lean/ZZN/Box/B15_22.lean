import ZZN.Finite2

/-! The box 15 × 22, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_15_22 : (List.range 15).all (checkBoxC checkInst2 15 22) = true := by native_decide

end ZZN
