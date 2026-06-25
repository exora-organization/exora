package validator

import (
	"fmt"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func Validate(s any) error {
	if err := validate.Struct(s); err != nil {
		if ve, ok := err.(validator.ValidationErrors); ok && len(ve) > 0 {
			return fmt.Errorf("%s failed on '%s' validation", ve[0].Field(), ve[0].Tag())
		}
		return err
	}
	return nil
}
