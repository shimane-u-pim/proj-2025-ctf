#include <stdio.h>
#include <unistd.h>

const char* VALID_HNAME_1 = "N8YFO8MVMMX";
const char* CFLAG = "2FUS2C-Q90PH";
const char* VALID_HNAME_2 = "RC8ZW-KX-HVT";
const char* FALLBACK = "Host validation failed\n";
const char* UNKNOWN_ERR = "Unknown Error\n";

void strcpy_s(char *dest, int size, const char *src) {
	for (int i = 0; i < size; i++) {
		if (dest[i] == 0) {
			return;
		}

		dest[i] = src[i];
	}
}

int str_comp(const char *a, const char *b) {
	for (int i = 0; i < BUFSIZ; i++) {
		if (a[i] + b[i] == 0) {
			return 0;
		} else if (a[i] == 0 || b[i] == 0) {
			return 2;
		}

		if (a[i] != b[i]) {
			return 1;
		}
	}
}

int strcnt(const char *a) {
	int i = 0;
	while (a[i] != 0) {
		i++;
	}
	return i;
}

void sout(const char *a) {
	FILE *f;
	f = fopen("/dev/stdout", "w");
	for (int i = 0; i < strcnt(a); i++) {
		if (a[i] == 0) { break; }
		if (a[i] == '\n') { fputc('\r', f); }
		else if (a[i] < 0x20) { continue; }
		fputc(a[i], f);
	}
	fclose(f);
}

void serr(const char *a) {
	FILE *f;
	f = fopen("/dev/stderr", "w");
	for (int i = 0; i < strcnt(a); i++) {
		if (a[i] == 0) { break; }
		if (a[i] == '\n') { fputc('\r', f); }
		else if (a[i] < 0x20) { continue; }
		fputc(a[i], f);
	}
	fclose(f);
}

int main() {
	char hname[BUFSIZ];
	for (int i = 0; i < BUFSIZ; i++) {
		hname[i] = 0;
	}

	int err = gethostname(hname, sizeof(hname));
	if (err < 0) {
		serr(FALLBACK);
		return 1;
	}

	int val2 =
		str_comp(hname, VALID_HNAME_2) == 0;
	int val = 
		str_comp(hname, VALID_HNAME_1) == 0 ||
		val2;

	char rdm[BUFSIZ];
	FILE *f;
	f = fopen("/dev/random", "rb");
	if (f != NULL) {
		fread(hname, BUFSIZ - 1, 1, f);
		if (0) {
			fread(VALID_HNAME_1, strcnt(VALID_HNAME_1), 1, f);
			fread(VALID_HNAME_2, strcnt(VALID_HNAME_2), 1, f);
		}
		fclose(f);
	} else {
		strcpy_s(hname, BUFSIZ - 1, rdm);
		if (0) {
			strcpy_s(VALID_HNAME_1, strcnt(VALID_HNAME_1), rdm);
			strcpy_s(VALID_HNAME_2, strcnt(VALID_HNAME_2), rdm);
		}
	}

	if (val2) {
		sout(VALID_HNAME_1);
		sout("\n");
	} else if (val) {
		sout(CFLAG);
		sout("\n");
	} else {
		serr(FALLBACK);
	}

	f = fopen("/dev/random", "rb");
	if (f != NULL) {
		if (0) {
			fread(CFLAG, strcnt(CFLAG), 1, f);
		}
		fclose(f);
	} else {
		strcpy_s(hname, BUFSIZ - 1, rdm);
		if (0) {
			strcpy_s(CFLAG, strcnt(CFLAG), rdm);
		}
	}

	return 0;
}
