using UnityEngine;

public class MobileControls : MonoBehaviour
{
    private Rigidbody2D rb;
    public float speed = 5f, jumpForce = 7f;
    private bool moveLeft, moveRight, jump;

    void Start()
    {
        rb = GetComponent<Rigidbody2D>();
    }

    void Update()
    {
        if (moveLeft)
            rb.linearVelocity = new Vector2(-speed, rb.linearVelocity.y);
        else if (moveRight)
            rb.linearVelocity = new Vector2(speed, rb.linearVelocity.y);
        else
            rb.linearVelocity = new Vector2(0, rb.linearVelocity.y);

        if (jump)
        {
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, jumpForce);
            jump = false;
        }
    }

    public void StartMoveLeft() { moveLeft = true; }
    public void StopMoveLeft() { moveLeft = false; }
    public void StartMoveRight() { moveRight = true; }
    public void StopMoveRight() { moveRight = false; }
    public void Jump() { jump = true; }
}
