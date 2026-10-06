import ZZN.Finite2

/-! The box 12 × 22, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_12_22 : (List.range 12).all (checkBoxC checkInst2 12 22) = true := by native_decide

end ZZN
