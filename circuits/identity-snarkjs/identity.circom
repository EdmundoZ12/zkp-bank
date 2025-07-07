template IsEqual() {
    signal input in[2];
    signal output out;
    
    component isz = IsZero();
    
    in[1] - in[0] ==> isz.in;
    
    isz.out ==> out;
}

template IsZero() {
    signal input in;
    signal output out;
    
    signal inv;
    
    inv <-- in!=0 ? 1/in : 0;
    
    out <== -in*inv +1;
    in*out === 0;
}

template IdentityVerifier() {
    signal private input cedula;
    signal private input fecha_nacimiento;
    signal private input codigo_secreto;
    
    signal input expected_cedula;
    signal input expected_fecha;
    signal input expected_codigo;
    
    signal output valid;
    
    component check_cedula = IsEqual();
    component check_fecha = IsEqual();
    component check_codigo = IsEqual();
    
    check_cedula.in[0] <== cedula;
    check_cedula.in[1] <== expected_cedula;
    
    check_fecha.in[0] <== fecha_nacimiento;
    check_fecha.in[1] <== expected_fecha;
    
    check_codigo.in[0] <== codigo_secreto;
    check_codigo.in[1] <== expected_codigo;
    
    signal temp1 <== check_cedula.out * check_fecha.out;
    signal temp2 <== temp1 * check_codigo.out;
    
    valid <== temp2;
}

component main = IdentityVerifier();