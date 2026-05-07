import re

with open("problems.txt", "r") as f:
    lines = f.read().splitlines()

formatted = []
formatted.append("# PR Tracker Security Audit & Problems\n")

state = "start"

for line in lines:
    line = line.strip()
    if not line:
        formatted.append("")
        continue
    
    if line == "//// Problems.txt":
        continue
        
    if line == "Critical — data loss or full auth bypass":
        formatted.append("## Summary: Critical — data loss or full auth bypass")
        continue
    if line == "High — reliability, consistency, or exploitable edge cases":
        formatted.append("## Summary: High — reliability, consistency, or exploitable edge cases")
        continue
    if line == "🔵 Medium — correctness, observability, and operational risk":
        formatted.append("## Summary: Medium — correctness, observability, and operational risk")
        continue
    
    if line in ["CRIT", "HIGH", "MED"]:
        continue
        
    if line == "CRITICAL FAILURES":
        formatted.append("## Detailed: CRITICAL FAILURES")
        continue
    if line == "HIGH SEVERITY FAILURES":
        formatted.append("## Detailed: HIGH SEVERITY FAILURES")
        continue
    if line == "MEDIUM SEVERITY FAILURES":
        formatted.append("## Detailed: MEDIUM SEVERITY FAILURES")
        continue
    if line == "ARCHITECTURAL FAILURES":
        formatted.append("## Detailed: ARCHITECTURAL FAILURES")
        continue
    if line == "RELIABILITY / FAILURE-CHAIN ISSUES":
        formatted.append("## Detailed: RELIABILITY / FAILURE-CHAIN ISSUES")
        continue
    if line == "MOST DANGEROUS COMBINED ATTACK PATH":
        formatted.append("## Detailed: MOST DANGEROUS COMBINED ATTACK PATH")
        continue
    if line == "PRIORITY FIX ORDER":
        formatted.append("## PRIORITY FIX ORDER")
        continue
        
    # Format numbered items like "1. Unauthenticated user creation"
    if re.match(r'^\[FIXED\] \d+\.', line) or re.match(r'^\d+\.', line):
        formatted.append(f"### {line}")
        continue
        
    if line.startswith("Immediate (same day)") or line.startswith("High priority") or line.startswith("Medium priority") or line.startswith("Long-term architecture"):
        formatted.append(f"### {line}")
        continue
        
    # Check if line is a file path reference, but don't add backticks if it starts with [FIXED]
    if "/" in line and (".js" in line or ".jsx" in line or ".yaml" in line) and not line.startswith("[FIXED]"):
        formatted.append(f"`{line}`")
        continue

    # Bullet points
    if line.startswith("- "):
        formatted.append(line)
    elif len(line) > 0 and state != "start" and not line.startswith("#"):
        # Just text
        formatted.append(line)
    else:
        formatted.append(line)

with open("problems.md", "w") as f:
    f.write("\n".join(formatted) + "\n")
