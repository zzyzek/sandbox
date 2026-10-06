import ZZN.Finite2

/-! The box 13 × 19, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_13_19 : (List.range 13).all (checkBoxC checkInst2 13 19) = true := by native_decide

end ZZN
