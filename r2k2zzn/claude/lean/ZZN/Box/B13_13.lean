import ZZN.Finite2

/-! The box 13 × 13, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_13_13 : (List.range 13).all (checkBoxC checkInst2 13 13) = true := by native_decide

end ZZN
