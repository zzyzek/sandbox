import ZZN.Finite2

/-! The box 17 × 19, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_17_19 : (List.range 17).all (checkBoxC checkInst2 17 19) = true := by native_decide

end ZZN
