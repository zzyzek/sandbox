import ZZN.Finite2

/-! The box 11 × 19, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_11_19 : (List.range 11).all (checkBoxC checkInst2 11 19) = true := by native_decide

end ZZN
