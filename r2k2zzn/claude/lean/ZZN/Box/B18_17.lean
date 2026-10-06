import ZZN.Finite2

/-! The box 18 × 17, checked by `native_decide` with the move search `moveB2`. -/

namespace ZZN

theorem box_18_17 : (List.range 18).all (checkBoxC checkInst2 18 17) = true := by native_decide

end ZZN
