import ZZN.Finite2

/-! The box 13 × 18, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_13_18 : (List.range 13).all (checkBoxC checkInst2 13 18) = true := by native_decide

end ZZN
