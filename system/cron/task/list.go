package task

import (
	"errors"
	"reflect"
)

// NewList comment
func NewList(funcList map[string]interface{}) (*List, error) {
	list := make(List, 100)

	for k, v := range funcList {
		err := list.bind(k, v)
		if err != nil {
			return &list, err
		}
	}

	return &list, nil
}

// Bind comment
func (f List) bind(name string, fn interface{}) (err error) {
	defer func() {
		if e := recover(); e != nil {
			err = errors.New(name + " is not callable.")
		}
	}()
	v := reflect.ValueOf(fn)
	v.Type().NumIn()
	f[name] = v
	return
}

// Run comment
func (f List) Run(name string, params ...interface{}) (result []reflect.Value, err error) {
	if _, ok := f[name]; !ok {
		err = errors.New(name + " does not exist.")
		return result, err
	}
	if len(params) != f[name].Type().NumIn() {
		err = errors.New("The number of params is not matched")
		return result, err
	}
	in := make([]reflect.Value, len(params))
	for k, param := range params {
		in[k] = reflect.ValueOf(param)
	}
	result = f[name].Call(in)
	return result, err
}
